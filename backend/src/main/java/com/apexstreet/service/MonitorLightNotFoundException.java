package com.apexstreet.service;

public class MonitorLightNotFoundException extends RuntimeException {
    public MonitorLightNotFoundException(String lightId) { super("Street light not found: " + lightId); }
}
