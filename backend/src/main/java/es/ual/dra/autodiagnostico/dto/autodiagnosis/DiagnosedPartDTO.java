package es.ual.dra.autodiagnostico.dto.autodiagnosis;

import es.ual.dra.autodiagnostico.model.entitity.core.Product;

public record DiagnosedPartDTO(
        Long idProduct,
        String name,
        String description,
        Double lowRangePrice,
        Double highRangePrice,
        String image
) {
    public static DiagnosedPartDTO from(Product p) {
        return new DiagnosedPartDTO(
                p.getIdProduct(),
                p.getName(),
                p.getDescription(),
                p.getLowRangePrice(),
                p.getHighRangePrice(),
                p.getImage());
    }
}
