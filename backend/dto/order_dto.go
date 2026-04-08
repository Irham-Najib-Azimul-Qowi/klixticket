package dto

type CreateOrderRequest struct {
	Items            []OrderItemRequest            `json:"items"`
	TicketItems      []OrderItemRequest            `json:"ticket_items"`
	MerchandiseItems []OrderMerchandiseItemRequest `json:"merchandise_items"`
	PaymentMethod    string                        `json:"payment_method,omitempty"`
}

type OrderItemRequest struct {
	TicketTypeID uint `json:"ticket_type_id" binding:"required"`
	Quantity     int  `json:"quantity" binding:"required,gt=0"`
}

type OrderMerchandiseItemRequest struct {
	MerchandiseID uint `json:"merchandise_id" binding:"required"`
	Quantity      int  `json:"quantity" binding:"required,gt=0"`
}

type OrderListQuery struct {
	Limit         int    `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset        int    `form:"offset" binding:"omitempty,min=0"`
	Status        string `form:"status" binding:"omitempty,oneof=pending paid failed expired cancelled"`
	PaymentStatus string `form:"payment_status" binding:"omitempty,oneof=pending paid failed expired"`
}
