package apperror

import "errors"

var (
	ErrNotFound     = errors.New("data tidak ditemukan")
	ErrUnauthorized = errors.New("tidak memiliki akses")
	ErrInvalidInput = errors.New("input tidak valid")
	ErrConflict     = errors.New("data sudah ada atau konflik")
	ErrInsufficient = errors.New("kuota tiket tidak mencukupi")
)

// Helper untuk mapping status code di Handler
func GetStatusCode(err error) int {
	switch {
	case errors.Is(err, ErrNotFound):
		return 404
	case errors.Is(err, ErrUnauthorized):
		return 401
	case errors.Is(err, ErrInvalidInput):
		return 400
	case errors.Is(err, ErrConflict), errors.Is(err, ErrInsufficient):
		return 409
	default:
		return 500
	}
}
