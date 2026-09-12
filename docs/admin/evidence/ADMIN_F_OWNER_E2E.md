# ADMIN.F — Owner technical E2E

**Verdict:** TECHNICAL_E2E_PASS

**Not** actual human owner acceptance.

```json
{
  "at": "2026-09-12T05:40:46.756Z",
  "base": "http://127.0.0.1:3000",
  "scenarios": {
    "health": {
      "status": "PROVEN",
      "http": 200
    },
    "owner_login": {
      "status": "PROVEN",
      "http": 200,
      "role": "admin"
    },
    "admin_home": {
      "status": "PROVEN",
      "http": 200
    },
    "excursion_draft": {
      "status": "PROVEN",
      "http": 201,
      "slug": "adminf-mtxyie5g-ex"
    },
    "excursion_publish_guard": {
      "status": "PROVEN",
      "http": 500
    },
    "excursion_publish": {
      "status": "PROVEN",
      "http": 200,
      "err": "{\"doc\":{\"title\":\"ADMIN.F Excursion mtxyie5g\",\"slug\":\"adminf-mtxyie5g-ex\",\"status\":\"published\",\"format\":\"walking\",\"shortDescription\":\"Коротко\",\"fullDescription\":null,\"priceOnRequest\":false,\"price\":1500"
    },
    "excursion_stable_slug": {
      "status": "PROVEN",
      "slug": "adminf-mtxyie5g-ex"
    },
    "excursion_unpublish": {
      "status": "PROVEN"
    },
    "article_draft": {
      "status": "PROVEN",
      "http": 201,
      "err": "{\"doc\":{\"id\":5,\"title\":\"ADMIN.F Article mtxyie5g\",\"slug\":\"adminf-mtxyie5g-art\",\"status\":\"draft\",\"materialType\":\"article\",\"category\":\"history\",\"tags\":[],\"season\":\"all\",\"isHiddenGem\":false,\"isFeatured\":"
    },
    "article_publish": {
      "status": "PROVEN",
      "http": 200
    },
    "article_stable_slug": {
      "status": "PROVEN"
    },
    "route_draft": {
      "status": "PROVEN",
      "http": 201,
      "err": "{\"doc\":{\"id\":3,\"title\":\"ADMIN.F Route mtxyie5g\",\"category\":\"architecture\",\"format\":\"walking\",\"type\":\"free\",\"price\":null,\"description\":\"Краткое описание маршрута ADMIN.F\",\"fullDescription\":null,\"durati"
    },
    "lead_create": {
      "status": "PROVEN",
      "http": 201,
      "err": "{\"doc\":{\"id\":21,\"name\":\"ADMIN.F Lead mtxyie5g\",\"company\":null,\"contact\":\"test@example.invalid\",\"email\":\"test@example.invalid\",\"phone\":null,\"telegram\":null,\"max\":null,\"preferredContactMethod\":null,\"mes"
    },
    "lead_crm_flow": {
      "status": "PROVEN"
    },
    "lead_decline_reason": {
      "status": "PROVEN",
      "http": 201
    },
    "delete_safety_published_excursion": {
      "status": "PROVEN",
      "http": 500,
      "published": "published"
    }
  },
  "verdict": "TECHNICAL_E2E_PASS"
}
```
