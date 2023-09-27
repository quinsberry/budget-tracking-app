```mermaid
erDiagram
	ColorScheme {
		value System
		value Light
		value Dark
	}
	User {
		String id PK  "dbgenerated(gen_random_uuid())"
		String email
		String password  "nullable"
		String fullName
		DateTime createdAt  "now()"
		DateTime updatedAt
	}
	UserSettings {
		String id PK  "dbgenerated(gen_random_uuid())"
		ColorScheme colorScheme "System"
		String userId FK
		String localeId FK  "nullable"
	}
	Locale {
		String id
		String languageCode
		String countryCode  "nullable"
		String script  "nullable"
		String formalName
		String nativeName
		String commonName  "nullable"
	}
	Card {
		String id PK  "dbgenerated(gen_random_uuid())"
		String description  "nullable"
		DateTime createdAt  "now()"
		DateTime updatedAt
		String bank
		String userId FK
	}
	Transaction {
		String id PK  "dbgenerated(gen_random_uuid())"
		String originalId
		String description  "nullable"
		String originalDescription  "nullable"
		Decimal amount
		Int currencyCode
		DateTime createdAt  "now()"
		String cardId FK
	}
	TransactionTag {
		Int id PK  "autoincrement()"
		String name
		DateTime createdAt  "now()"
		DateTime updatedAt
	}
	TransactionTagsOfTransaction {
		String transactionId FK
		Int tagId FK
		DateTime createdAt  "now()"
	}
	User }|--|{ UserSettings : settings
	UserSettings }|--|{ User : user
	UserSettings }o--|| Locale : locale
	UserSettings }o--|| ColorScheme : "enum:colorScheme"
	Card }o--|| User : user
	Transaction }o--|| Card : card
	TransactionTagsOfTransaction }o--|| Transaction : transaction
	TransactionTagsOfTransaction }o--|| TransactionTag : tag

```
