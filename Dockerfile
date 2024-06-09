# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
# TODO: Update the copy location of the key.json file
COPY key.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Define environment variables
# TODO: replace PROJECT_ID and LOCATION local variables
ENV PORT=3000
ENV PROJECT_ID=turnkey-layout-423219-d0
ENV LOCATION=asia-south1
ENV GOOGLE_APPLICATION_CREDENTIALS=./key.json


# Run the app
CMD ["npm", "start"]
