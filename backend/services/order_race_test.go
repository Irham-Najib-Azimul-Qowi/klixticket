package services

import (
	"context"
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"mastutik-api/dto"
	"mastutik-api/repositories"
)

// Mock Xendit for race test
type mockXenditRace struct {
	XenditService
}

func (m *mockXenditRace) CreateInvoice(orderID uuid.UUID, email string, amount float64, itemsDescription string, paymentMethod string) (string, string, error) {
	return "inv-123", "http://xendit.co/checkout", nil
}

func (m *mockXenditRace) GetInvoiceStatus(invoiceID string) (string, error) {
	return "PAID", nil
}

func TestOrderService_CreateOrder_RaceCondition(t *testing.T) {
	// 1. Setup DB Mock
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %v", err)
	}
	defer sqlDB.Close()

	db, err := gorm.Open(postgres.New(postgres.Config{
		Conn: sqlDB,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open gorm: %v", err)
	}

	// 2. Setup Repos & Service
	userRepo := repositories.NewUserRepository(db)
	eventRepo := repositories.NewEventRepository(db)
	merchRepo := repositories.NewMerchandiseRepository(db)
	orderRepo := repositories.NewOrderRepository(db)
	xendit := &mockXenditRace{}

	service := NewOrderService(orderRepo, eventRepo, merchRepo, userRepo, xendit)

	// 3. Test Data
	userID := uint(1)
	ticketID := uint(101)
	quantity := 1
	initialQuota := 5
	concurrentUsers := 10 // More than quota

	for i := 0; i < concurrentUsers; i++ {
		mock.ExpectBegin()
		// Mock Ticket Check inside CreateOrder
		mock.ExpectQuery(`SELECT \* FROM "ticket_types"`).
			WithArgs(ticketID).
			WillReturnRows(sqlmock.NewRows([]string{"id", "remaining_quota", "price", "active_status", "sales_start_at", "sales_end_at"}).
				AddRow(ticketID, initialQuota, 50000.0, true, time.Now().Add(-1*time.Hour), time.Now().Add(1*time.Hour)))

		if i < initialQuota {
			// Success scenario
			mock.ExpectExec(`UPDATE "ticket_types" SET "remaining_quota"=remaining_quota - \$1`).
				WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected
			
			mock.ExpectExec(`INSERT INTO "orders"`).WillReturnResult(sqlmock.NewResult(1, 1))
			mock.ExpectExec(`INSERT INTO "order_items"`).WillReturnResult(sqlmock.NewResult(1, 1))
			mock.ExpectCommit()

			// Post-commit: User lookup for Xendit
			mock.ExpectQuery(`SELECT \* FROM "users"`).
				WithArgs(userID).
				WillReturnRows(sqlmock.NewRows([]string{"id", "email"}).AddRow(userID, "user@test.com"))
			
			// Post-commit: Payment insertion/update
			mock.ExpectExec(`INSERT INTO "payments"`).WillReturnResult(sqlmock.NewResult(1, 1))
			
			// Post-commit: Final Order lookup
			mock.ExpectQuery(`SELECT \* FROM "orders"`).
				WillReturnRows(sqlmock.NewRows([]string{"id", "status"}).AddRow(uint(1), "PENDING"))
		} else {
			// Failure scenario (Oversell prevention)
			mock.ExpectExec(`UPDATE "ticket_types" SET "remaining_quota"=remaining_quota - \$1`).
				WillReturnResult(sqlmock.NewResult(0, 0)) 
			mock.ExpectRollback()
		}
	}

	// 5. Execute Concurrent Orders
	var wg sync.WaitGroup
	successCount := 0
	failCount := 0
	var mu sync.Mutex

	req := dto.CreateOrderRequest{
		Items: []dto.OrderItemRequest{
			{TicketTypeID: ticketID, Quantity: quantity},
		},
	}

	for i := 0; i < concurrentUsers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			order, err := service.CreateOrder(context.Background(), userID, req)
			mu.Lock()
			if err == nil && order != nil {
				successCount++
			} else {
				failCount++
			}
			mu.Unlock()
		}()
	}

	wg.Wait()

	// 6. Assertions
	fmt.Printf("Success: %d, Fail: %d\n", successCount, failCount)
	if successCount != initialQuota {
		t.Errorf("Expected exactly %d successes (quota), but got %d", initialQuota, successCount)
	}
	
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unmet expectations: %s", err)
	}
}
