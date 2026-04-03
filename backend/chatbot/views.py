from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

class ChatbotView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        message = request.data.get('message', '').lower()
        
        # Integrate AI Service
        try:
            from chatbot.services import AIService
            ai_service = AIService()
            response_data = ai_service.get_chat_response(message)
            return Response(response_data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                "reply": f"Internal Error: {str(e)}",
                "suggest_create_ticket": False
            }, status=200) # Return 200 so frontend displays the error message as chat reply
