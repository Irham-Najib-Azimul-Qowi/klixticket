package dto

type CreateTaxRequest struct {
	Name         string  `json:"name" binding:"required,min=2,max=100"`
	Percentage   float64 `json:"percentage" binding:"required,min=0,max=100"`
	ActiveStatus bool    `json:"active_status"`
}

type UpdateTaxRequest struct {
	Name         *string  `json:"name" binding:"omitempty,min=2,max=100"`
	Percentage   *float64 `json:"percentage" binding:"omitempty,min=0,max=100"`
	ActiveStatus *bool    `json:"active_status"`
}
