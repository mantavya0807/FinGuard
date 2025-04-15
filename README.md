# 💸 FinGuard

**Shop smarter. Stay safer. Build better financial habits.**

---

## 🔥 Inspiration

We realized how often people leave money on the table by not using the best credit card for purchases. But that’s just the tip of the iceberg. Many users fall victim to scam websites, accidentally overspend, or simply don’t understand where their money is going each month. With so many credit card reward programs, sketchy merchants, and confusing spending patterns, there’s a real need for a tool that simplifies everything.

That’s what inspired us to create **FinGuard** — a tool to help users shop smarter, stay safer online, and gain awareness of their spending habits to build a healthier financial future.

---

## 💡 What It Does

**FinGuard** is a browser extension and web dashboard that helps users spend smarter, stay safer, and build better financial habits.

Here’s what it does:

- **Recommends** the best credit card for each purchase based on the user's linked credit cards, including rewards, points, and active discounts.
- **Warns** users about scam or unsafe websites using site reputation checks.
- **Tracks** spending by category.
- Provides a **financial dashboard** showing income, expenses, savings, and cashback earned.
- **Analyzes** spending patterns to help users understand their habits and avoid overspending.

---

## 🛠️ How We Built It

### 🔌 Browser Extension

- **Frontend:** Built using React, CSS, and JavaScript. React handles dynamic UI components to ensure smooth and responsive interactions.
- **Card Recommendations:** We fetch card-specific recommendations from MongoDB, where we store information about different credit cards, including rewards, points, and active discounts, to provide the best suggestions for each purchase.
- **Site Scam Checker (Nudge):** We used **IPQS (IP Quality Score)** for our Nudge feature, which checks the reputation of websites and alerts users if a site is unsafe. This feature warns users about scammy or potentially malicious websites by showing a “nudge” message when the site is flagged.

### 📊 Web Dashboard

- **Frontend:** Built with React and TailwindCSS, offering a dynamic and responsive UI that allows users to interact with real-time financial data and insights efficiently.
- **Backend:** **Node.js** was used for the backend, handling user authentication, data processing, and interactions with external APIs.
- **RAG Model (Gemini):** We integrated **Gemini** to use a **RAG (Retrieval-Augmented Generation)** model that analyzes user transaction data. This helps us provide personalized financial insights, answer user queries about spending, and offer suggestions based on transaction history.
- **Insights Recharge:** We used **Insights Recharge** to provide advanced data analysis, allowing users to gain deep insights into their spending patterns and make smarter financial decisions.
- **Database:** **MongoDB** was chosen for its flexibility and scalability in storing user profiles, transaction data, and card details.

---

## ✨ Nudge: Behavioral Design for Finance

Our project leverages the behavioral economics principle of "nudging" to promote financial well-being. Recognizing that people often struggle with financial planning due to inertia or overwhelming choices, we designed a user-friendly application that subtly guides users toward healthier financial habits.

By implementing intuitive default options such as automatic enrollment in savings plans, our app encourages consistent saving without restricting individual choice. Additionally, we utilized framing techniques to present financial information positively, making users more comfortable with beneficial financial decisions.

We also included clear visual cues and personalized notifications to reinforce productive behaviors, like budgeting or timely bill payments. Through these subtle yet impactful adjustments, users naturally adopt better financial habits without feeling pressured or coerced.

---

## 🚀 The Vision

**FinGuard** isn’t just a product — it’s a mission:

- To make online shopping safer.
- To turn complex financial data into clear, actionable insights.
- To empower people to take control of their finances with confidence.

---

## 🧠 Tech Stack

| Frontend        | Backend       | AI/ML      | Database  | External APIs |
|-----------------|---------------|------------|-----------|----------------|
| React + TailwindCSS | Node.js       | Gemini (RAG), Insights Recharge | MongoDB   | IPQS (IP Quality Score) |

---

## 🙌 Made with ❤️, passion, and way too many energy drinks.
