package com.apexstreet.model;

public enum AreaType {
    RESIDENTIAL("Residential"),
    COMMERCIAL("Commercial"),
    ROAD_HIGHWAY("Road/Highway"),
    PARK("Park"),
    SCHOOL_ZONE("School Zone");

    private final String label;
    AreaType(String label) { this.label = label; }
    public String getLabel() { return label; }
    public static AreaType fromLabel(String value) {
        for (AreaType type : values()) if (type.label.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) return type;
        throw new IllegalArgumentException("Invalid area type.");
    }
}
