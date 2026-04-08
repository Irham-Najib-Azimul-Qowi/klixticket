package utils

import (
	"fmt"
	"net/smtp"
	"os"
)

type MailRequest struct {
	To      string
	Subject string
	Body    string
}

func SendEmail(req MailRequest) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	from := os.Getenv("SMTP_FROM")

	// If SMTP is not configured, return error to avoid misleading success
	if smtpHost == "" || smtpUser == "" {
		fmt.Printf("--- EMAIL FAILED: SMTP NOT CONFIGURED ---\nTo: %s\nSubject: %s\n---------------------------------------\n", req.To, req.Subject)
		return fmt.Errorf("layanan email belum dikonfigurasi (SMTP_HOST/USER kosong)")
	}

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	msg := []byte(fmt.Sprintf("To: %s\r\nSubject: %s\r\n\r\n%s\r\n", req.To, req.Subject, req.Body))

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{req.To}, msg)
	if err != nil {
		return err
	}

	return nil
}

func SendResetPasswordEmail(to string, token string) error {
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", os.Getenv("FRONTEND_URL"), token)
	body := fmt.Sprintf("Halo,\n\nKami menerima permintaan untuk meriset password akun Anda.\nSilakan klik link di bawah ini untuk melanjutkan:\n\n%s\n\nLink ini akan kadaluarsa dalam 1 jam.\nJika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.", resetLink)
	
	req := MailRequest{
		To:      to,
		Subject: "Reset Password - Mastutik",
		Body:    body,
	}

	return SendEmail(req)
}
