package utils

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const maxImageUploadSize = 5 << 20

var allowedImageExtensions = map[string]struct{}{
	".jpg":  {},
	".jpeg": {},
	".png":  {},
	".webp": {},
}

func SaveUploadedImage(c *gin.Context, fieldName, category string) (*string, error) {
	fileHeader, err := c.FormFile(fieldName)
	if err != nil {
		return nil, nil
	}

	if fileHeader.Size > maxImageUploadSize {
		return nil, fmt.Errorf("image size exceeds %d MB", maxImageUploadSize>>20)
	}

	imagePath, err := saveImageFile(fileHeader, category)
	if err != nil {
		return nil, err
	}

	return &imagePath, nil
}

func IsManagedUploadPath(path string) bool {
	normalized := filepath.ToSlash(strings.TrimSpace(path))
	return strings.HasPrefix(normalized, "/uploads/images/") || strings.HasPrefix(normalized, "uploads/images/")
}

func DeleteManagedUpload(path *string) error {
	if path == nil {
		return nil
	}

	normalized := filepath.ToSlash(strings.TrimSpace(*path))
	if !IsManagedUploadPath(normalized) {
		return nil
	}

	normalized = strings.TrimPrefix(normalized, "/")
	if normalized == "" {
		return nil
	}

	if err := os.Remove(normalized); err != nil && !os.IsNotExist(err) {
		return err
	}

	return nil
}

func saveImageFile(fileHeader *multipart.FileHeader, category string) (string, error) {
	extension := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if _, ok := allowedImageExtensions[extension]; !ok {
		return "", fmt.Errorf("unsupported image format: %s", extension)
	}

	safeCategory := strings.Trim(strings.ToLower(category), "/\\ ")
	if safeCategory == "" {
		safeCategory = "misc"
	}

	targetDir := filepath.Join("uploads", "images", safeCategory)
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		return "", err
	}

	filename := fmt.Sprintf("%d-%s%s", time.Now().UnixMilli(), uuid.New().String(), extension)
	targetPath := filepath.Join(targetDir, filename)

	src, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	dst, err := os.Create(targetPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := dst.ReadFrom(src); err != nil {
		return "", err
	}

	return "/" + filepath.ToSlash(targetPath), nil
}
