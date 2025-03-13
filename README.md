# Course Visualization Project

## Repository Structure

```sh
.
├── README.md               # Project overview and setup instructions
├── data_extract/           # Data files and preprocessing scripts
│   ├── data/               # Contains course csv files and cleaned json file
│   ├── data_extract.py     # Preprocessing
├── older_scripts/          # JS testing scripts
├── index.html              # Entry point
├── courseDetails.html      # Secondary webpage
├── main_scipt.js           # Primary javascript functionality for index.html
├── style.css               # Styling for index.html
├── requirements.txt        # Python dependancies
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Dependency lock file
```

## Setup Instructions
This repository contains both Python and Node.js components. Follow the steps below to set up your environment and run the project locally.

## Prerequisites
Make sure you have the following installed on your system:
- [Python 3.x](https://www.python.org/downloads/)
- [Node.js (LTS version)](https://nodejs.org/)
- [Git](https://git-scm.com/)

## Setup Instructions

### 1. Clone the Repository
```sh
git clone https://github.com/tanaym12/sci_coursemap.git
cd sci_coursemap
```

### 2. Set Up Python Environment
#### a. Create a Virtual Environment (Optional but Recommended)
```sh
python -m venv venv
```
#### b. Activate the Virtual Environment
- **Windows (PowerShell):**
  ```sh
  venv\Scripts\Activate
  ```
- **Mac/Linux:**
  ```sh
  source venv/bin/activate
  ```
#### c. Install Python Dependencies
```sh
pip install -r requirements.txt
```

### 3. Set Up Node.js Environment
#### a. Install Dependencies
```sh
npm install
```

### 4. Preview Locally

Open index.html in your browser to preview the project locally.