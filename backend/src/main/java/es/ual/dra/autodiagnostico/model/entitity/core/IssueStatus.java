package es.ual.dra.autodiagnostico.model.entitity.core;

public enum IssueStatus {
    DRAFT,
    WORKSHOP_ASSIGNED,
    BUDGET_ACCEPTED,
    IN_PROGRESS,
    RESOLVED,
    CANCELLED;

    public static IssueStatus from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("El estado es obligatorio");
        }
        String normalized = value.trim().toUpperCase().replace('-', '_').replace(' ', '_');
        try {
            return IssueStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Estado invalido: " + value);
        }
    }
}
