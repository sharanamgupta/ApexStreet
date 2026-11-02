package com.apexstreet.service;

public class DuplicateStreetLightException extends RuntimeException {
    public DuplicateStreetLightException(String message) {
        super(message);
    }
}
