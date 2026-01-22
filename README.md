# 🧩 Graph Visualizer

An **interactive graph visualization platform** focused on helping users understand **core graph algorithms visually and intuitively**. This project emphasizes *learning by seeing*, enabling real-time exploration of graph traversal and connectivity concepts instead of treating algorithms as black-box logic.

---

## 🔍 Project Overview

This application allows users to **construct graphs dynamically** and visualize how classical graph algorithms operate step by step. The primary goal is to build strong intuition around **graph traversal, connectivity, and critical nodes**, making it ideal for **DSA learners, interview preparation, and classroom demonstrations**.

The project is built using **Lovable**, enabling rapid iteration through prompts while still allowing full local development using standard frontend tooling.

---

## 🧠 Core Topics & Focus Areas

### 📌 Graph Visualization

* Interactive node and edge creation
* Real-time visual updates during algorithm execution
* Clear distinction between:

  * Unvisited nodes
  * Currently active nodes
  * Visited nodes

---

### 🔁 Graph Traversal Algorithms

#### Breadth-First Search (BFS)

* Visualizes **level-order traversal**
* Demonstrates queue-based expansion
* Highlights distance layers from the source node

#### Depth-First Search (DFS)

* Shows **deep recursive / stack-based exploration**
* Visualizes backtracking clearly
* Useful for understanding tree and graph structures

---

### 🧩 Graph Connectivity & Critical Nodes

#### Articulation Points (Cut Vertices)

* Identifies nodes whose removal **disconnects the graph**
* Visualizes:

  * DFS discovery time
  * Low-link values
  * Parent–child relationships
* Emphasizes why and how a node becomes critical to connectivity

This section strongly focuses on **DFS-based graph theory concepts**, which are often difficult to understand without visualization.

---

## 🎯 Educational Philosophy

* Step-by-step execution instead of instant results
* Strong emphasis on **algorithm intuition over memorization**
* Designed for:

  * Data Structures & Algorithms learning
  * Technical interview preparation
  * Teaching and demonstrations

---

## 🛠️ Technology Stack

This project is built with modern frontend technologies:

* **Vite** — Fast development tooling
* **TypeScript** — Type-safe JavaScript
* **React** — Component-based UI
* **shadcn-ui** — Clean and accessible UI components
* **Tailwind CSS** — Utility-first styling

---

## ✏️ Editing the Project

### Using Lovable

* Open the project in Lovable
* Make changes using prompts
* All changes are automatically committed to this repository

---

### Using Your Local IDE

Requirements:

* Node.js
* npm (recommended via `nvm`)

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate into the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

### Editing Directly on GitHub

* Navigate to any file in the repository
* Click the **Edit (✏️)** button
* Commit your changes

---

### Using GitHub Codespaces

* Click **Code → Codespaces → New codespace**
* Edit files directly in the browser
* Commit and push changes when finished

---

## 🚀 Deployment

Deploy instantly via **Lovable**:

* Open the project in Lovable
* Click **Share → Publish**

---

## 🌐 Custom Domain Support

You can connect a custom domain:

* Go to **Project → Settings → Domains**
* Click **Connect Domain**

Learn more: [https://docs.lovable.dev/features/custom-domain#custom-domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 📌 Summary

This project serves as a **visual learning tool for graph algorithms**, with a strong focus on:

* BFS and DFS traversal
* Graph connectivity
* Articulation point detection

It is designed to turn abstract graph theory concepts into **clear, visual, and interactive experiences**.

> *See the algorithm. Understand the logic.* 🚀
