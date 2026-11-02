package com.apexstreet.service;

public class StreetLightNotFoundException extends RuntimeException {
    public StreetLightNotFoundException(String lightId) {
        super("Street light with ID '" + lightId + "' was not found.");
    }
}
