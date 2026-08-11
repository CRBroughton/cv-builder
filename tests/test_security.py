from uuid import uuid4

import jwt as pyjwt
import pytest

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_verify_password_accepts_correct_password() -> None:
    hashed = hash_password("correct-horse-batter-staple")
    assert verify_password("correct-horse-batter-staple", hashed)


def test_verify_password_rejects_wrong_password() -> None:
    hashed = hash_password("correct-horse-batter-staple")
    assert not verify_password("wrong-password", hashed)


def test_access_token_round_trips_user_id() -> None:
    user_id = uuid4()
    token = create_access_token(user_id)
    assert decode_access_token(token) == user_id


def test_decode_access_token_rejects_garbage_token() -> None:
    with pytest.raises(pyjwt.exceptions.InvalidTokenError):
        decode_access_token("this-is-not-a-real-jwt")
