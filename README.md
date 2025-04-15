# 💸 FinGuard

**Shop smarter. Stay safer. Build better financial habits.**

---

## 🔥 Inspiration

We realized how often people leave money on the table by not using the best credit card for purchases. But that’s just the tip of the iceberg.

Many users:
- Fall victim to scam websites
- Accidentally overspend
- Don’t understand where their money is going each month

With so many credit card reward programs, sketchy merchants, and confusing spending patterns, there’s a real need for a tool that simplifies everything.

**That’s what inspired us to create FinGuard — a tool to help users shop smarter, stay safer online, and gain awareness of their spending habits to build a healthier financial future.**

---

## 💡 What It Does

FinGuard is a **browser extension and web dashboard** that helps users spend smarter, stay safer, and build better financial habits.

**Key Features:**
- ✅ Recommends the best credit card for each purchase based on the user's linked cards (rewards, points, active discounts)
- 🚨 Warns users about scam or unsafe websites using site reputation checks
- 📊 Tracks spending by category
- 🧾 Provides a financial dashboard showing income, expenses, savings, and cashback earned
- 🧠 Analyzes spending patterns to help users understand habits and avoid overspending

---

## 🛠️ How We Built It

### 🔌 Browser Extension
- **Frontend:** Built with React, CSS, and JavaScript for smooth, dynamic UI interactions.
- **Card Recommendations:** Pulls real-time data from **MongoDB** to suggest the best card based on rewards and discounts.
- **Scam Site Checker (Nudge):** Integrated with **IPQS (IP Quality Score)** to flag unsafe or malicious websites and alert the user.

### 📊 Web Dashboard
- **Frontend:** React + TailwindCSS for a responsive and modern interface.
- **Backend:** Node.js for authentication, API interactions, and backend logic.
- **Data Storage:** MongoDB handles user profiles, transaction data, and card reward details.
- **AI-Powered Insights (Gemini + RAG):** Used Gemini's RAG model to analyze user transaction data, deliver personalized insights, and answer user spending queries.
- **Advanced Analytics:** Integrated **Insights Recharge** for deep financial behavior analysis and smarter decision-making.

---

## ✨ Nudge: Behavioral Design for Finance

Our app embraces the principles of **behavioral economics** by leveraging nudges that guide users without limiting freedom.

**Examples of Nudging in FinGuard:**
- 💰 **Automatic savings options** help users build financial cushions effortlessly.
- 🔔 **Framing & notifications** turn budgeting and bill payment into positive experiences.
- 📉 **Spending visualizations** gently steer users away from overspending.
  
These subtle cues help users adopt healthier financial habits **without pressure or coercion**.

---

## 🚀 The Vision

FinGuard isn't just a product — it’s a mission:
- To make online shopping safer
- To turn complex financial data into clear, actionable insights
- To empower people to take control of their finances with confidence

---

## 🧠 Tech Stack

| Frontend        | Backend       | AI/ML      | Database  | External APIs |
|-----------------|---------------|------------|-----------|----------------|
| React + TailwindCSS | Node.js       | Gemini (RAG), Insights Recharge | MongoDB   | IPQS (IP Quality Score) and Google Safe Browsing API |

---

## 📎 Try It Out

- Browser extension: [Link coming soon]
- Dashboard: [Live demo coming soon]

---

## 🙌 Made with love, passion, and way too many energy drinks.
