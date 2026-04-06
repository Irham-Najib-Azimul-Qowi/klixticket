package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
)

type XenditService interface {
	CreateInvoice(orderID uuid.UUID, email string, amount float64, itemsDescription string) (invoiceID string, checkoutURL string, err error)
}

type xenditService struct {
	secretKey string
}

func NewXenditService() XenditService {
	return &xenditService{
		secretKey: os.Getenv("XENDIT_API_KEY"),
	}
}

func (s *xenditService) CreateInvoice(orderID uuid.UUID, email string, amount float64, itemsDescription string) (string, string, error) {
	// Jika Key kosong, tetap gunakan Mock untuk testing lokal
	if s.secretKey == "" {
		return "inv_mock_" + uuid.New().String()[:8], "https://checkout-staging.xendit.co/web/mock", nil
	}

	// 1. Persiapkan Payload sesuai API Xendit V2
	payload := map[string]interface{}{
		"external_id":      orderID.String(),
		"amount":           amount,
		"payer_email":      email,
		"description":      itemsDescription,
		"invoice_duration": 86400, // 24 jam
	}

	jsonData, _ := json.Marshal(payload)

	// 2. Buat HTTP Request
	req, err := http.NewRequest("POST", "https://api.xendit.co/v2/invoices", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", "", err
	}

	// 3. Basic Auth (Xendit butuh secret key di Encode Base64 sebagai Username, Password dikosongkan)
	auth := base64.StdEncoding.EncodeToString([]byte(s.secretKey + ":"))
	req.Header.Set("Authorization", "Basic "+auth)
	req.Header.Set("Content-Type", "application/json")

	// 4. Execute dengan Timeout (Penting untuk VPS RAM 1GB agar tidak hanging)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", fmt.Errorf("xendit connection error: %v", err)
	}
	defer resp.Body.Close()

	// 5. Decode Response
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", "", err
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", "", fmt.Errorf("xendit api error: %v", result["message"])
	}

	// 6. Ambil data yang dibutuhkan
	invoiceID := result["id"].(string)
	checkoutURL := result["invoice_url"].(string)

	return invoiceID, checkoutURL, nil
}