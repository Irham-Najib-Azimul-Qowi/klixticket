package dto

type MerchandiseListQuery struct {
	Limit  int `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset int `form:"offset" binding:"omitempty,min=0"`
}

type CreateMerchandiseRequest struct {
	Name         string  `json:"name" binding:"required,min=2"`
	Description  string  `json:"description"`
	Price        float64 `json:"price" binding:"required,gt=0"`
	Stock        int     `json:"stock" binding:"required,gte=0"`
	ImageURL     *string `json:"image_url"`
	ActiveStatus *bool   `json:"active_status"`
}

type UpdateMerchandiseRequest struct {
	Name         string  `json:"name" binding:"required,min=2"`
	Description  string  `json:"description"`
	Price        float64 `json:"price" binding:"required,gt=0"`
	Stock        int     `json:"stock" binding:"required,gte=0"`
	ImageURL     *string `json:"image_url"`
	ActiveStatus *bool   `json:"active_status" binding:"required"`
}
