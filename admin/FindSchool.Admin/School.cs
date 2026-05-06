using SQLite;

namespace FindSchool.Admin;

[Table("Schools")]
public class School
{
    [PrimaryKey]
    [Column("eiin")]
    public string Eiin { get; set; } = string.Empty;

    [Indexed(Name = "ix_schools_name", Order = 1)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("name_bn")]
    public string NameBn { get; set; } = string.Empty;

    [Column("level")]
    public string Level { get; set; } = string.Empty;

    [Column("address")]
    public string Address { get; set; } = string.Empty;

    [Indexed(Name = "ix_schools_division", Order = 1)]
    [Column("division")]
    public string Division { get; set; } = string.Empty;

    [Indexed(Name = "ix_schools_district", Order = 1)]
    [Column("district")]
    public string District { get; set; } = string.Empty;

    [Indexed(Name = "ix_schools_upazila", Order = 1)]
    [Column("upazila")]
    public string Upazila { get; set; } = string.Empty;

    [Column("latitude")]
    public double? Latitude { get; set; }

    [Column("longitude")]
    public double? Longitude { get; set; }

    [Column("geocoded")]
    public bool Geocoded { get; set; }

    // Stats (sourced from IPEMIS CSV, present in scrape but previously dropped).
    [Column("total_teachers")]
    public int? TotalTeachers { get; set; }

    [Column("total_students")]
    public int? TotalStudents { get; set; }

    // Contact info (NOT in IPEMIS API today — kept nullable so when we find
    // a second source we can populate without another schema migration).
    [Column("phone")]
    public string? Phone { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("website")]
    public string? Website { get; set; }
}
