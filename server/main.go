package main

import (
        "bytes"
        "encoding/json"
        "fmt"
        "io"
        "log"
        "net/http"
        "os"
        "time"

        "github.com/go-chi/chi/v5"
        "github.com/go-chi/chi/v5/middleware"
        "github.com/go-chi/cors"
)

type Message struct {
        Role    string `json:"role"`
        Content string `json:"content"`
}

type ChatRequest struct {
        Message string `json:"message"`
}

var history []Message

func main() {
        r := chi.NewRouter()

        r.Use(middleware.Logger)
        r.Use(middleware.Recoverer)
        r.Use(cors.Handler(cors.Options{
                AllowedOrigins:   []string{"*"},
                AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
                AllowedHeaders:   []string{"Content-Type", "Authorization"},
                AllowCredentials: true,
        }))

	r.Get("/api/chat/history", func(w http.ResponseWriter, r *http.Request) {
                w.Header().Set("Content-Type", "application/json")
                if history == nil {
                        history = []Message{}
                }
                json.NewEncoder(w).Encode(history)
        })

	r.Post("/api/chat", func(w http.ResponseWriter, r *http.Request) {
                w.Header().Set("Content-Type", "application/json")
                var req ChatRequest
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        http.Error(w, err.Error(), http.StatusBadRequest)
                        return
                }

                userMsg := Message{Role: "user", Content: req.Message}
                history = append(history, userMsg)

                respMsg, err := callOpenAI(history)
                if err != nil {
                        log.Printf("OpenAI error: %v", err)
                        errResp := Message{Role: "assistant", Content: "Sorry, I'm having trouble connecting to the AI."}
                        json.NewEncoder(w).Encode(errResp)
                        return
                }

                history = append(history, respMsg)
                json.NewEncoder(w).Encode(respMsg)
        })

        log.Println("Go server listening on :3000")
        if err := http.ListenAndServe(":3000", r); err != nil {
                log.Fatalf("Server failed: %v", err)
        }
}

func callOpenAI(msgs []Message) (Message, error) {
        apiKey := os.Getenv("AI_INTEGRATIONS_OPENAI_API_KEY")
        baseURL := os.Getenv("AI_INTEGRATIONS_OPENAI_BASE_URL")

        if baseURL == "" {
                baseURL = "https://api.openai.com/v1"
        }

        payload := map[string]interface{}{
                "model":    "gpt-5.1",
                "messages": msgs,
        }

        bodyBytes, _ := json.Marshal(payload)

        req, _ := http.NewRequest("POST", baseURL+"/chat/completions", bytes.NewBuffer(bodyBytes))
        req.Header.Set("Content-Type", "application/json")
        req.Header.Set("Authorization", "Bearer "+apiKey)

        client := &http.Client{Timeout: 60 * time.Second}
        resp, err := client.Do(req)
        if err != nil {
                return Message{}, err
        }
        defer resp.Body.Close()

        if resp.StatusCode != 200 {
                b, _ := io.ReadAll(resp.Body)
                return Message{}, fmt.Errorf("status %d: %s", resp.StatusCode, string(b))
        }

        var result struct {
                Choices []struct {
                        Message Message `json:"message"`
                } `json:"choices"`
        }

        if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
                return Message{}, err
        }

        if len(result.Choices) == 0 {
                return Message{}, fmt.Errorf("no choices in response")
        }

        return result.Choices[0].Message, nil
}
