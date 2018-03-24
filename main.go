package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/satori/go.uuid"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

const uiDir = "ui/build"

type Node struct {
	ID   string `json:"id"`
	Name string `json:"name,omitempty"`
}

type Edge struct {
	ID     string `json:"id"`
	Name   string `json:"name,omitempty"`
	Source *Node  `json:"source"`
	Target *Node  `json:"target"`
}

type Graph struct {
	ID    string  `json:"id"`
	Name  string  `json:"name,omitempty"`
	Nodes []*Node `json:"nodes"`
	Edges []*Edge `json:"edges"`
}

var graphs = make(map[string]*Graph)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/api/graphs", createGraphHandler).Methods("POST")
	r.HandleFunc("/api/graphs/{id}", showGraphHandler).Methods("GET")
	r.PathPrefix("/").Handler(http.HandlerFunc(catchAllHandler))

	http.Handle("/", r)

	port, portExists := os.LookupEnv("PORT")

	if !portExists {
		port = "80"
	}

	http.ListenAndServe(":"+port, nil)
}

func catchAllHandler(w http.ResponseWriter, r *http.Request) {
	path := uiDir + r.URL.Path

	if _, err := os.Stat(path); err == nil {
		http.ServeFile(w, r, path)
	} else {
		http.ServeFile(w, r, uiDir+"/index.html")
	}
}

func showGraphHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	id := mux.Vars(r)["id"]
	g, exists := graphs[id]

	if !exists {
		http.NotFound(w, r)
		return
	}

	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(g); err != nil {
		panic(err)
	}

	fmt.Printf("%s\tServed graph %s.\n", time.Now().Format(time.RFC822), id)
}

func createGraphHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	g := new(Graph)
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		panic(err)
	}

	if err := r.Body.Close(); err != nil {
		panic(err)
	}

	if err := json.Unmarshal(body, g); err != nil {
		w.WriteHeader(http.StatusUnprocessableEntity)
		return
	}

	id := uuid.NewV4().String()
	g.ID = id
	graphs[id] = g

	fmt.Printf("%s\tCreated graph %s. Now storing %d graphs.\n", time.Now().Format(time.RFC822), id, len(graphs))

	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(g); err != nil {
		panic(err)
	}
}
