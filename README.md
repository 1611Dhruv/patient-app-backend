# Node.js Application Docker Setup

This Dockerfile sets up a Node.js application that interacts with Google Cloud Platform services.

### Prerequisites

Before running the Docker container, follow these steps to set up Google Cloud Platform services:

1. **Create a Google Cloud Project:**

   Create a project on [Cloud Console](https://cloud.google.com) if you haven't already.

2. **Generate a Service Account Key:**

   Follow Google's documentation on [Service Accounts](https://cloud.google.com/iam/docs/keys-create-delete) to generate a service account key for your project.

3. **Save Service Account Key:**

   Save the service account key (`key.json`) in the `patient-app-backend` directory of your cloned repository.

4. **Update Environment Variables:**

   After saving the service account key, update the environment variables in your `.env` file or directly in the `Dockerfile`:

   - **GOOGLE_APPLICATION_CREDENTIALS:** Assign the path to your service account's JSON key file (`./key.json`).
   - **PROJECT_ID:** Set this to your Google Cloud project ID.
   - **LOCATION:** Choose a location for your Google Cloud services (e.g., `asia-south1` for Mumbai). [More about GCP locations](https://cloud.google.com/about/locations).

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/1611Dhruv/patient-app-backend.git
   cd patient-app-backend
   ```

2. **Build the Docker Image:**

   Ensure you have Docker installed. Then, build the Docker image:

   ```bash
   docker build -t my-node-app .
   ```

### Running the Application

3. **Run the Docker Container:**

   ```bash
   docker run -p 3000:3000 my-node-app
   ```

   Replace `.env` with your environment file containing the necessary variables.

### Notes

- Ensure your `key.json` file is securely managed and not exposed in public repositories.
- Modify other configurations in the `Dockerfile` and application code as needed for your specific use case.
