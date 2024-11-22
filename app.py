import streamlit as st
import requests

# Backend API URL (Replace with your backend server URL)
BACKEND_URL = "http://localhost:4000/optimizecode"

# App Title
st.title("Code Optimization Tool")

# Input Section
st.header("Input Your Code")
language = st.selectbox("Select Programming Language", ["Python", "JavaScript", "Java", "C++", "C#"])
code_input = st.text_area("Paste Your Code Here", height=300, placeholder="Enter your code snippet here...")

# Submit Button
if st.button("Optimize Code"):
    if not code_input.strip():
        st.error("Please enter valid code before submitting.")
    else:
        # Send Code to Backend for Optimization
        with st.spinner("Optimizing your code..."):
            try:
                response = requests.post(
                    BACKEND_URL,
                    json={"code": code_input, "language": language},
                )
                response.raise_for_status()  # Raise error for bad HTTP responses
                optimized_code = response.json().get("optimizedCode", "No optimized code returned.")

                # Display Optimized Code
                st.header("Optimized Code")
                st.code(optimized_code, language=language.lower())

            except requests.exceptions.RequestException as e:
                st.error(f"An error occurred: {str(e)}")
