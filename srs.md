## 1. Introduction

### 1.1 Purpose
This document describes the software requirements for the invoice generator named **"Dwarakamai"**. It provides a detailed description of system functionalities, constraints, and interfaces required for the development and evaluation of the system.

### 1.2 Scope
The Invoice Generator enables the user (company owner) to perform invoice operations digitally through web and mobile platforms. The system supports secure login, invoice creation, invoice history management, viewing statistics of previous invoices, and secure logout functionality.

### 1.3 Intended Audience
This document is intended for developers, project reviewers, faculty evaluators, and stakeholders who are involved in the design, development, testing, and evaluation of the Invoice Generator system.

### 1.4 Document Overview
This SRS document includes an overview of the system, detailed functional and non-functional requirements, system constraints, and interface specifications necessary for implementing the Invoice Generator.

## 2. Overall Description

### 2.1 Product Perspective
The Invoice Generator **"Dwarakamai"** is a web-based application designed to simplify the process of creating and managing invoices digitally. The system functions as a standalone application and does not depend on external enterprise systems. It provides an intuitive interface for generating invoices, storing invoice history, and exporting invoice data. The system may integrate with browser-based storage or backend services for data persistence.

### 2.2 Product Functions
The major functions of the Invoice Generator system include:
- Secure user login and logout
- Creation of professional invoices
- Addition of company details, client details, and GST number
- Automatic calculation of totals and taxes
- Viewing and managing previously generated invoices
- Downloading invoices in supported formats
- Exporting invoice data as CSV files
- Displaying basic statistics related to invoices

### 2.3 User Classes and Characteristics
The system supports the following user class:
- **User (Company Owner / Authorized Staff):**  
  The primary user of the system who generates, views, and manages invoices. The user is expected to have basic knowledge of web applications and invoice-related terminology.

### 2.4 Operating Environment
The Invoice Generator operates in the following environment:
- Web browsers such as Google Chrome, Mozilla Firefox, and Microsoft Edge
- Desktop and mobile devices with an active internet connection
- Client-side technologies (HTML, CSS, JavaScript)
- Optional backend or local storage for data persistence

### 2.5 Design and Implementation Constraints
The system is developed under the following constraints:
- Must be accessible through standard web browsers
- Should follow basic data security practices
- Must ensure accuracy in invoice calculations
- Should comply with basic invoicing and taxation norms

### 2.6 Assumptions and Dependencies
The system assumes:
- Users have a stable internet connection
- Users provide correct invoice and GST details
- Browser support for modern JavaScript features

The system may depend on:
- Browser storage or backend database for storing invoice data
