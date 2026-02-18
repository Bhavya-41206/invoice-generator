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

## 3. Functional Requirements

### 3.1 User Authentication
- The system shall allow users to log in using valid credentials.
- The system shall allow users to log out securely.
- The system shall restrict access to invoice features to authenticated users.

### 3.2 Invoice Creation
- The system shall allow users to create a new invoice.
- The system shall allow users to enter company details.
- The system shall allow users to enter client details.
- The system shall allow users to add multiple invoice items.
- The system shall allow users to enter quantity and price for each item.
- The system shall automatically calculate item totals.

### 3.3 Tax and GST Management
- The system shall allow users to enter a GST number.
- The system shall calculate GST based on the provided values.
- The system shall display subtotal, tax amount, and grand total.

### 3.4 Invoice Management
- The system shall store generated invoices.
- The system shall display a list of previously generated invoices.
- The system shall allow users to view invoice details.
- The system shall allow users to edit invoice information before finalization.

### 3.5 Invoice Download and Export
- The system shall allow users to download invoices.
- The system shall support exporting invoice data in CSV format.
- The system shall generate invoices in a readable and professional format.

### 3.6 Invoice Statistics
- The system shall display statistics related to previously generated invoices.
- The system shall show total number of invoices generated.
- The system shall show total invoice amount over a selected period.

### 3.7 Data Persistence
- The system shall store invoice data securely.
- The system shall retrieve stored invoice data when requested by the user.

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- The system shall respond to user actions within an acceptable time.
- The system shall support smooth invoice creation without noticeable delays.
- The system shall handle multiple invoice operations efficiently.

### 4.2 Security Requirements
- The system shall restrict access to authorized users only.
- The system shall protect sensitive invoice and business data.
- The system shall prevent unauthorized modification of invoice data.

### 4.3 Usability Requirements
- The system shall provide a user-friendly and intuitive interface.
- The system shall be easy to navigate for users with basic technical knowledge.
- The system shall minimize user input errors during invoice creation.

### 4.4 Reliability Requirements
- The system shall ensure accuracy in invoice calculations.
- The system shall maintain data consistency during invoice storage and retrieval.
- The system shall function correctly under normal operating conditions.

### 4.5 Availability Requirements
- The system shall be available whenever the user has internet access.
- The system shall maintain consistent functionality across supported browsers.

### 4.6 Scalability Requirements
- The system shall support an increase in the number of invoices without performance degradation.
- The system shall allow future feature expansion.

### 4.7 Maintainability Requirements
- The system shall be designed using modular components.
- The system shall allow easy updates and bug fixes.

### 4.8 Portability Requirements
- The system shall run on multiple modern web browsers.
- The system shall support both desktop and mobile platforms.

## 5. External Interface Requirements

### 5.1 User Interface
- The system shall provide a responsive web-based user interface.
- The system shall allow users to input company details, client details, GST number, and invoice items through structured forms.
- The system shall display calculated totals, taxes, and invoice summaries clearly.
- The system shall provide buttons for invoice creation, editing, downloading, and exporting.
- The system shall maintain a consistent layout across all pages.

### 5.2 Hardware Interfaces
- The system shall operate on standard desktop and laptop computers.
- The system shall support mobile devices such as smartphones and tablets.
- No specialized hardware is required to use the system.

### 5.3 Software Interfaces
- The system shall run on modern web browsers such as Google Chrome, Mozilla Firefox, and Microsoft Edge.
- The system may use browser-based storage or backend database systems for data persistence.
- The system may support file export functionality (e.g., CSV download).

### 5.4 Communication Interfaces
- The system shall use standard HTTP/HTTPS protocols for communication.
- The system shall require an active internet connection for full functionality.
