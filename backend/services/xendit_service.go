package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
)

type XenditService interface {
	CreateInvoice(orderID uuid.UUID, email string, amount float64, itemsDescription string, paymentMethod string) (invoiceID string, checkoutURL string, err error)
}

type xenditService struct {
	secretKey string
}

func NewXenditService() XenditService {
	key := strings.TrimSpace(os.Getenv("XENDIT_API_KEY"))
	// LIAT DI TERMINAL GO AR! Muncul gak key-nya?
	fmt.Println("INFO: Xendit Key yang terbaca:", key)
	return &xenditService{
		secretKey: key,
	}
}

func (s *xenditService) CreateInvoice(orderID uuid.UUID, email string, amount float64, itemsDescription string, paymentMethod string) (string, string, error) {
	if s.secretKey == "" {
		s.secretKey = strings.TrimSpace(os.Getenv("XENDIT_API_KEY"))
	}

	fmt.Printf("INFO: Membuat invoice untuk Order %s dengan Metode: %s\n", orderID, paymentMethod)

	// Jika Key tetap kosong, kembalikan Error (Bukan URL Mock yang 404)
	if s.secretKey == "" {
		return "", "", fmt.Errorf("XENDIT_API_KEY is not configured. Please add it to your .env file and restart the server.")
	}

	// 1. Persiapkan Payload sesuai API Xendit V2
	payload := map[string]interface{}{
		"external_id":      orderID.String(),
		"amount":           amount,
		"payer_email":      email,
		"description":      itemsDescription,
		"invoice_duration": 86400, // 24 jam
	}

	// Mapping Metode Pembayaran untuk Xendit V2 Invoices (Hanya jika diset)
	if paymentMethod != "" {
		switch paymentMethod {
		case "BCA":
			payload["available_banks"] = []map[string]interface{}{{"bank_code": "BCA", "collection_type": "POOL"}}
		case "BRI":
			payload["available_banks"] = []map[string]interface{}{{"bank_code": "BRI", "collection_type": "POOL"}}
		case "QRIS":
			payload["available_qr_codes"] = []map[string]interface{}{{"external_id": "qr-" + orderID.String(), "type": "DYNAMIC"}}
		}
	}
	// Jika paymentMethod kosong, biarkan payload tanpa available_banks/available_qr_codes
	// agar Xendit menampilkan SEMUA metode yang aktif di dashboard.

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

	// 5. Baca Response Body
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", fmt.Errorf("failed to read xendit response: %v", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		return "", "", fmt.Errorf("failed to parse xendit response: %v. Raw: %s", err, string(bodyBytes))
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		// Log error buat developer liat di console
		fmt.Printf("DEBUG: Xendit Error Response: %s\n", string(bodyBytes))
		
		msg, _ := result["message"].(string)
		if msg == "" {
			msg = string(bodyBytes) // fallback ke raw body kalau gak ada field message
		}
		return "", "", fmt.Errorf("xendit api error (Status %d): %v", resp.StatusCode, msg)
	}

	// 6. Ambil data yang dibutuhkan
	invoiceID, ok1 := result["id"].(string)
	checkoutURL, ok2 := result["invoice_url"].(string)

	if !ok1 || !ok2 {
		// kalau xendit ngirim error, kita tangkep pesannya dhan
		msg, _ := result["message"].(string)
		return "", "", fmt.Errorf("xendit response ngaco: %v", msg)
	}/* */

	return invoiceID, checkoutURL, nil
}
