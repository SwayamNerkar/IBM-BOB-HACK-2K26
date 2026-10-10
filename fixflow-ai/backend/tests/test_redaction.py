"""
Tests for the credential redaction utility.
"""
import pytest
from backend.services.redaction import redact_credentials


# --- Cases that must be redacted ---

def test_redact_password_assignment():
    result = redact_credentials('password = "supersecret123"')
    assert "supersecret123" not in result
    assert "REDACTED" in result


def test_redact_api_key_assignment():
    result = redact_credentials('api_key = "sk-abc123XYZ456"')
    assert "sk-abc123XYZ456" not in result
    assert "REDACTED" in result


def test_redact_bearer_token():
    result = redact_credentials("Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")
    assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in result
    assert "REDACTED" in result


def test_redact_authorization_header_basic():
    result = redact_credentials("Authorization: Basic dXNlcjpwYXNz")
    assert "dXNlcjpwYXNz" not in result
    assert "REDACTED" in result


def test_redact_database_url_with_credentials():
    result = redact_credentials("DATABASE_URL=postgres://admin:mypassword@localhost:5432/mydb")
    assert "mypassword" not in result
    assert "REDACTED" in result


def test_redact_private_key_marker():
    pem = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0Z3VS5JJcds3\n-----END RSA PRIVATE KEY-----"
    result = redact_credentials(pem)
    assert "MIIEpAIBAAKCAQEA0Z3VS5JJcds3" not in result
    assert "REDACTED" in result


def test_redact_access_token():
    result = redact_credentials('access_token = "tok_live_abcdef1234567890"')
    assert "tok_live_abcdef1234567890" not in result
    assert "REDACTED" in result


def test_redact_aws_secret_key():
    result = redact_credentials("AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY")
    assert "wJalrXUtnFEMI" not in result
    assert "REDACTED" in result


# --- Cases that must NOT be redacted ---

def test_ordinary_code_preserved():
    code = "def add(a, b):\n    return a + b\n\nresult = add(1, 2)\nprint(result)"
    assert redact_credentials(code) == code


def test_variable_named_count_preserved():
    code = "count = 42\nprint(count)"
    assert redact_credentials(code) == code


def test_none_input_returns_empty_string():
    assert redact_credentials(None) == ""


# --- Mixed sample: secret and valid code together ---

def test_mixed_code_redacts_secret_preserves_code():
    code = (
        "import os\n"
        "api_key = 'sk-realkey123'\n"
        "def greet(name):\n"
        "    return f'Hello, {name}'\n"
    )
    result = redact_credentials(code)
    assert "sk-realkey123" not in result
    assert "def greet" in result
    assert "return f'Hello, {name}'" in result
