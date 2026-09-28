package com.eshopping.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StockLocationForm {
    private Long id;

    @NotBlank(message = "Code is required")
    @Pattern(regexp = "[A-Za-z0-9_-]{2,30}", message = "Use only letters, numbers, _ or -")
    private String code;

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 255)
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
