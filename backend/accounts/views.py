from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ratelimit import limits
from rest_framework_simplejwt.tokens import RefreshToken

FIFTEEN_MINUTES = 900
API_KEY = "MY_SUPER_SECRET_KEY"

@api_view(["POST"])
@limits(calls=15, period=FIFTEEN_MINUTES)
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            "responseCode": 0,
            "responseMessage": "Logged in successfully",
            "data": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            "dataCount": 2,
        })
    else:
        return Response({
            "responseCode": 4,
            "responseMessage": "Invalid username or password",
            "data": [],
            "dataCount": 0,
        }, status=status.HTTP_401_UNAUTHORIZED)


def jwt_request(payload: dict):
    refresh = RefreshToken()
    for key, value in payload.items():
        refresh[key] = value
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@api_view(["GET"])
def get_jwt_token(request):
    api_key = request.query_params.get("api_key")
    if api_key != API_KEY:
        return Response({
            "responseCode": 4,
            "responseMessage": "Invalid API key",
            "data": [],
            "dataCount": 0,
        }, status=status.HTTP_401_UNAUTHORIZED)


    tokens = jwt_request({"scope": "public", "issued_for": "frontend"})
    return Response({
        "responseCode": 0,
        "responseMessage": "success",
        "data": tokens,
        "dataCount": len(tokens),
    })

@api_view(["GET"])
def get_jwt_token_by_client_id(request):
    client_id = request.query_params.get("client_id")
    if not client_id:
        return Response({
            "responseCode": 4,
            "responseMessage": "Missing client_id",
            "data": [],
            "dataCount": 0,
        }, status=status.HTTP_400_BAD_REQUEST)

    tokens = jwt_request({"client_id": client_id})
    return Response({
        "responseCode": 0,
        "responseMessage": "success",
        "data": tokens,
        "dataCount": len(tokens),
    })
