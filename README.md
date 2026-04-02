# GetDoa

GetDoa is a mobile app companion website for an Islamic prayer companion app. Browse authentic Doa (supplications), create personalized prayer lists, and deepen your spiritual journey.

- **Discover** 90+ authentic Islamic prayers with translations and references
- **Create** personalized prayer lists with export to beautiful images
- **Learn** prayer and their meanings

## API Reference

### Base URL

```
https://getdoa.com/api
```

### Public Endpoints

#### 1. Get Paginated Doa List

```
GET /api/doa?page=1&limit=10
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | 1-indexed page number |
| `limit` | number | `10` | Items per page, from `1` to `100` |
| `search` | string | - | Optional search across doa name, content, and meaning |

Notes:
- If `search` is provided, the response also includes a top-level `search` field.
- Returned doa objects use the current database-backed camelCase field names.

**Response:**

```json
{
  "data": [
    {
      "slug": "penghulu-bagi-doa-keampunan",
      "nameMy": "Penghulu Bagi Doa Keampunan",
      "nameEn": "The Master of Forgiveness Prayer",
      "content": "اَللَّهُمَّ أَنْتَ رَبِّيْ ...",
      "referenceMy": "Riwayat al-Bukhari (6306)",
      "referenceEn": "Narrated by al-Bukhari (6306)",
      "meaningMy": "Ya Allah, Engkau adalah Tuhanku...",
      "meaningEn": "O Allah, You are my Lord...",
      "categoryNames": ["Keampunan", "Forgiveness", "Taubat", "Repentance"],
      "descriptionMy": null,
      "descriptionEn": null,
      "contextMy": null,
      "contextEn": null,
      "contentHash": "sha256-hash-value",
      "createdAt": "2026-04-02T00:00:00.000Z",
      "updatedAt": "2026-04-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 99,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. Get Random Doa

```
GET /api/doa/random
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Optional category filter |
| `count` | number | Optional result count from `1` to `10` |

Notes:
- Without `count`, or with `count=1`, the response shape is `{ "data": { ... } }`
- With `count > 1`, the response shape is `{ "data": [...], "count": n, "category": "..." }`

**Single-item response:**

```json
{
  "data": {
    "slug": "penghulu-bagi-doa-keampunan",
    "nameMy": "Penghulu Bagi Doa Keampunan",
    "nameEn": "The Master of Forgiveness Prayer",
    "content": "اَللَّهُمَّ أَنْتَ رَبِّيْ ...",
    "referenceMy": "Riwayat al-Bukhari (6306)",
    "referenceEn": "Narrated by al-Bukhari (6306)",
    "meaningMy": "Ya Allah, Engkau adalah Tuhanku...",
    "meaningEn": "O Allah, You are my Lord...",
    "categoryNames": ["Keampunan", "Forgiveness"]
  }
}
```

**Batch response:**

```json
{
  "data": [
    {
      "slug": "penghulu-bagi-doa-keampunan",
      "nameMy": "Penghulu Bagi Doa Keampunan",
      "nameEn": "The Master of Forgiveness Prayer",
      "content": "اَللَّهُمَّ أَنْتَ رَبِّيْ ..."
    }
  ],
  "count": 3,
  "category": "Keampunan"
}
```

#### 3. Get a Public Shared Doa List

```
GET /api/list/:listId
```

This endpoint returns published public lists only.

**Response:**

```json
{
  "id": "dl_123",
  "title": "Daily Protection",
  "description": "Morning and evening duas",
  "language": "en",
  "entries": [
    {
      "slug": "penghulu-bagi-doa-keampunan",
      "title": "The Master of Forgiveness Prayer",
      "text": "اَللَّهُمَّ أَنْتَ رَبِّيْ ...",
      "translation": "O Allah, You are my Lord...",
      "source": "Narrated by al-Bukhari (6306)"
    }
  ],
  "meta": {
    "itemCount": 1,
    "createdAt": "2026-04-02T00:00:00.000Z",
    "updatedAt": "2026-04-02T00:00:00.000Z"
  }
}
```

### Usage Examples

**JavaScript:**

```ts
const paginated = await fetch('https://getdoa.com/api/doa?page=1&limit=10').then(
  (r) => r.json(),
)

const random = await fetch(
  'https://getdoa.com/api/doa/random?category=Keampunan&count=3',
).then((r) => r.json())
```

**cURL:**

```bash
curl "https://getdoa.com/api/doa?page=1&limit=10"
curl "https://getdoa.com/api/doa?search=ampunan&page=1&limit=5"
curl "https://getdoa.com/api/doa/random?category=Keampunan"
curl "https://getdoa.com/api/list/<public-list-id>"
```

### Categories

Categories are returned in the `categoryNames` field. Common examples include Keampunan, Taubat, Bacaan Pagi, Bacaan Petang, Perlindungan, Kesihatan, Keluarga, Rezeki, Solat, Ramadan, and more.
