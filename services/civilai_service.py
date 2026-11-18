import google.generativeai as genai
from google.generativeai.types import content_types
from collections.abc import Iterable
from src.config import Config

class CivilAIService:
    """Core service interfacing with Google Gemini AI for Civil Engineering tasks."""

    def __init__(self):
        Config.validate()
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def _generate_response(self, prompt: str, image_data: list[bytes] = None) -> str:
        """Helper method to generate text content using Gemini."""
        try:
            contents = [prompt]
            if image_data:
                for img_bytes in image_data:
                    contents.append({
                        "mime_type": "image/jpeg",
                        "data": img_bytes
                    })
            
            response = self.model.generate_content(contents)
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}"

    def civil_qa(self, query: str, lang: str = "English") -> str:
        """Answers civil engineering questions."""
        system_prompt = f"You are an expert civil engineer. Provide a detailed answer in {lang} to the following query: "
        return self._generate_response(system_prompt + query)

    def solve_assignment(self, problem: str, image_data: list[bytes] = None) -> str:
        """Solves assignment problems, potentially from images."""
        prompt = f"Solve this civil engineering assignment problem step-by-step: {problem}"
        return self._generate_response(prompt, image_data)

    def process_ocr(self, document_bytes: bytes, mime_type: str) -> str:
        """Extracts text from image or PDF bytes using Gemini's multimodal capabilities."""
        try:
            prompt = "Extract all text and describe any figures in this document, specialized for Civil Engineering context."
            contents = [
                prompt,
                {
                    "mime_type": mime_type,
                    "data": document_bytes
                }
            ]
            response = self.model.generate_content(contents)
            return response.text
        except Exception as e:
            return f"Error processing application/document: {str(e)}"

    def create_diagram(self, prompt: str) -> str:
        """Generates instructions or Mermaid code for a civil engineering diagram."""
        system_prompt = "Generate a Mermaid diagram for the following civil engineering concept. Do not include markdown code blocks, just raw mermaid code: "
        return self._generate_response(system_prompt + prompt)

    def get_project_ideas(self, domain: str) -> str:
        """Provides project ideas for specific civil engineering domains."""
        prompt = f"Generate 5 innovative final year major project ideas for civil engineering students focusing on {domain}."
        return self._generate_response(prompt)

if __name__ == "__main__":
    # Test service initialization
    try:
        service = CivilAIService()
        print("CivilAIService initialized successfully.")
        
        # Simple test query
        # print(service.civil_qa("What is hydraulic conductivity?"))
        
    except Exception as e:
        print(f"Service initialization failed: {e}")