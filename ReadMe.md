# Full-Stack Medical Record Management System

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.9-blue)
![Django](https://img.shields.io/badge/Django-4.0-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)

## 📋 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Introduction

The **Full-Stack Medical Record Management System** is a comprehensive web application designed to digitally scan, organize, and manage medical records efficiently. By converting physical documents into digital format, the system ensures that medical records are easily accessible, securely stored, and systematically organized.

## Features

- **Custom Scanning System**: Utilizes Python libraries like OpenCV and Pillow to digitize physical documents seamlessly.
- **Robust User Authentication**: Ensures that only authorized personnel can access sensitive medical data.
- **Secure Data Handling**: Implements best practices for data security and privacy.
- **Efficient Database Management**: Leverages MySQL for reliable and scalable relational database management.
- **Responsive Front-End**: Built with JavaScript, HTML, CSS, and Bootstrap for a user-friendly interface across all devices.
- **CRUD Operations**: Allows creation, reading, updating, and deletion of medical records with ease.
- **Real-Time Updates**: Implements real-time data updates using JavaScript for a dynamic user experience.
- **RESTful API Integrations**: Facilitates smooth communication between client and server through well-designed APIs.

## Technologies Used

### Front-End

- **HTML5 & CSS3**: Structuring and styling the web application.
- **JavaScript (ES6)**: Adding interactivity and dynamic content.
- **Bootstrap 5**: Ensuring a responsive and mobile-first design.

### Back-End

- **Django (Python)**: Serving as the primary framework for the server-side logic.
- **MySQL**: Managing relational data with efficiency and reliability.

### Libraries

- **OpenCV**: Handling image processing for document scanning.
- **Pillow**: Managing image manipulation tasks.

## Installation

Follow these steps to set up the project locally:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/medical-record.git
   cd medical-record
    ```
Create a Virtual Environment

```bash

python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
Install Dependencies

```bash

pip install -r requirements.txt
```
Configure the Database

    Ensure MySQL is installed and running.
    Create a database for the project.
    Update the settings.py file with your database credentials.

Apply Migrations

```bash

python manage.py migrate
```
Run the Development Server

```bash

    python manage.py runserver
```
    Access the Application

    Open your browser and navigate to http://localhost:8000.

Usage

Once the application is running:

    Scan Documents: Use the built-in scanning feature to digitize physical medical records.
    Manage Records: Create, read, update, or delete medical records as needed.
    Secure Access: Log in with your credentials to access the system securely.
    Real-Time Updates: Experience instant updates as you interact with the application.

Contributing

Contributions are welcome! Please follow these steps:

    Fork the Repository

    Create a Feature Branch

  ```bash

git checkout -b feature/YourFeature
  ```
Commit Your Changes

```bash

git commit -m "Add some feature"
```
Push to the Branch

```bash

    git push origin feature/YourFeature
```
    Open a Pull Request

License

This project is licensed under a special License.
