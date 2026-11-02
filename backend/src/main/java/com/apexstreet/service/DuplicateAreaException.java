package com.apexstreet.service;

public class DuplicateAreaException extends RuntimeException {
    public DuplicateAreaException(String name) { super("An area with the name '" + name + "' already exists."); }
}
