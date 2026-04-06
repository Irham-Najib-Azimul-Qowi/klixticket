package utils

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

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
			default:
				errors[field] = fmt.Sprintf("Kesalahan pada kolom %s (%s)", field, fe.Tag())
			}
		}
	} else {
		errors["error"] = err.Error()
	}

	return errors
}
