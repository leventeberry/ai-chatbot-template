package services

// CreateUserInput holds the data for creating a new user
type CreateUserInput struct {
	TenantID  string
	WidgetID  string
	FirstName string
	LastName  string
	Email     string
	Password  string
	PhoneNum  string
	Role      string
	Tier      string
}

// UpdateUserInput holds the data for updating a user
type UpdateUserInput struct {
	FirstName *string
	LastName  *string
	Email     *string
	Password  *string
	PhoneNum  *string
	Role      *string
	Tier      *string
}

// RegisterInput holds the data for user registration
type RegisterInput struct {
	FirstName string
	LastName  string
	Email     string
	Password  string
	PhoneNum  string
	Role      string
	Tier      string
}

// PaginationParams holds pagination parameters
type PaginationParams struct {
	Page     int
	PageSize int
}

