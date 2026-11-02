package com.apexstreet.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private String message;
    private UserDto user;

    public AuthResponse() {
    }

    public AuthResponse(String token, String message, UserDto user) {
        this.token = token;
        this.message = message;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }
}
