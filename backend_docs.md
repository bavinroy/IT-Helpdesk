
# Backend System Architecture: AI-Powered IT Helpdesk

## 1. Directory Structure
```text
backend/
├── manage.py
├── helpdesk_core/          # Django Project Configuration
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py             # Added for WebSocket Support
│   └── wsgi.py
├── tickets/                # App: Ticket Management
│   ├── models.py           # User, Ticket, Comment
│   ├── serializers.py      # DRF Serializers
│   ├── views.py            # API ViewSets
│   ├── consumers.py        # WebSocket Consumer logic
│   ├── routing.py          # WebSocket URL routing
│   └── ml_integration.py   # Connector to AI models
├── chatbot/                # App: NLP Chatbot Engine
│   ├── services.py         # Gemini / HF Integration
│   └── views.py            # WebSocket/HTTP endpoints
├── ai_engine/              # Custom ML Logic (Standalone)
│   ├── categorization/     # DistilBERT model files
│   ├── priority/           # Logistic Regression model
│   └── trainer.py          # Script for retraining
```

## 2. ML & Real-time Implementation Plan

### Real-time (WebSockets)
*   **Library:** Django Channels 4.0.
*   **Broker:** Redis for cross-process communication.
*   **Logic:** When a `Ticket` model's `status` or `priority` is updated in the database (signals), a notification is pushed to the `TicketConsumer` which broadcasts to all connected Staff clients via a `group_send`.

### Model 1: Ticket Auto-Categorization
*   **Algorithm:** TF-IDF Vectorization + Multinomial Naive Bayes (Baseline) OR DistilBERT (SOTA).
*   **Data:** 5,000 synthetic ticket descriptions labeled [Hardware, Software, Network, Access].
*   **Feature Engineering:** Removing stop words, lemmatization using `spaCy`.

### Model 2: Priority Prediction
*   **Input:** Description length, keyword density (e.g., "emergency", "lost work", "smoke"), and Department.
*   **Algorithm:** Random Forest Classifier.
*   **Output:** [LOW, MEDIUM, HIGH, CRITICAL].

### Model 3: Recommendation Engine
*   **Method:** Sentence Transformers + FAISS.
*   **Logic:** When a new ticket arrives, convert description to a vector. Search FAISS index for top 3 similar past resolved tickets. Suggest those solutions to the IT staff.

## 3. Key API & Socket Endpoints
*   `POST /api/tickets/create/` -> Triggers ML inference before saving.
*   `GET /api/dashboard/stats/` -> Aggregated metrics for Admin charts.
*   `WS /ws/tickets/` -> Real-time status update stream for the dashboard.
