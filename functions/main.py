# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app
from firebase_admin import auth

initialize_app()

@https_fn.on_request()
def checkAuth(req: https_fn.Request) -> https_fn.Response:
    try:
        session_cookie = req.cookies.get('session')
        if not session_cookie:
            raise ValueError('No session cookie found')

        # Verify the session cookie
        decoded_claims = auth.verify_session_cookie(session_cookie, check_revoked=True)
        print(f"The user is: {decoded_claims['email']}")
        return https_fn.Response('<script>window.location.href = "/player.html";</script>', status=302)
    except Exception as e:
        print(f"Authentication error: {e}")
        return https_fn.Response('<script>window.location.href = "/";</script>', status=302)