package utils

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

// IsStrongPassword mengecek apakah password minimal 8 karakter dan mengandung huruf serta angka
func IsStrongPassword(password string) bool {
	if len(password) < 8 {
		return false
	}
	hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	return hasLetter && hasNumber
}

// FormatValidationError mengonversi error validator menjadi pesan yang ramah pengguna
func FormatValidationError(err error) map[string]string {
	errors := make(map[string]string)

	if ve, ok := err.(validator.ValidationErrors); ok {
		for _, fe := range ve {
			field := strings.ToLower(fe.Field())
			switch fe.Tag() {
			case "required":
				errors[field] = fmt.Sprintf("Kolom %s wajib diisi", field)
			case "email":
				errors[field] = "Format email tidak valid"
			case "min":
				errors[field] = fmt.Sprintf("Kolom %s minimal %s karakter", field, fe.Param())
			case "max":
				errors[field] = fmt.Sprintf("Kolom %s maksimal %s karakter", field, fe.Param())
			case "eqfield":
				errors[field] = fmt.Sprintf("Kolom %s harus sama dengan %s", field, fe.Param())
			default:
				errors[field] = fmt.Sprintf("Kesalahan pada kolom %s (%s)", field, fe.Tag())
			}
		}
	} else {
		errors["error"] = err.Error()
	}

	return errors
}
