package com.apexstreet.service;

public class AreaNotFoundException extends RuntimeException {
    public AreaNotFoundException(Long id) { super("Area not found: " + id); }
}
