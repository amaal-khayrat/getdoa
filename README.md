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

### Endpoints

#### 1. Get Paginated Doa List

```
GET /api/doa?page=1&limit=10
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 10 | Items per page (max: 100) |
| `search` | string | - | Search query (optional) |

**Response:**

```json
{
  "data": [
    {
      "slug": "penghulu-bagi-doa-keampunan",
      "name_my": "Penghulu Bagi Doa Keampunan",
      "name_en": "The Master of Forgiveness Prayer",
      "content": "اَللَّهُمَّ أَنْتَ رَبِّيْ ...",
      "meaning_my": "Ya Allah, Engkau adalah Tuhanku...",
      "meaning_en": "O Allah, You are my Lord...",
      "reference_my": "Riwayat al-Bukhari (6306)",
      "reference_en": "Narrated by Bukhari (6306)",
      "category_names": ["Keampunan", "Forgiveness", "Taubat", "Repentance"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 90,
    "totalPages": 9,
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
| `category` | string | Filter by category (optional) |
| `count` | number | Number of results (1-10, optional) |

**Examples:**

```bash
# Single random Doa
GET /api/doa/random

# Random from category
GET /api/doa/random?category=Keampunan

# Multiple random Doa
GET /api/doa/random?count=3
```

**Response:**

```json
{
  "data": {
    "slug": "penghulu-bagi-doa-keampunan",
    "name_my": "Penghulu Bagi Doa Keampunan",
    "name_en": "The Master of Forgiveness Prayer",
    "content": "...",
    "meaning_my": "...",
    "meaning_en": "...",
    "category_names": ["Keampunan", "Forgiveness"]
  }
}
```

### Usage Examples

**JavaScript:**

```typescript
fetch('https://getdoa.com/api/doa/random')
  .then(r => r.json())
  .then(data => console.log(data.data));
```

**cURL:**

```bash
curl "https://getdoa.com/api/doa?page=1&limit=10"
curl "https://getdoa.com/api/doa/random"
```

### Categories

Keampunan, Taubat, Bacaan Pagi, Bacaan Petang, Perlindungan, Kesihatan, Keluarga, Rezeki, Solat, Ramadan, and more.

