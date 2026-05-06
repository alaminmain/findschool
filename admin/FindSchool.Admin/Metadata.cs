using SQLite;

namespace FindSchool.Admin;

[Table("Metadata")]
public class Metadata
{
    [PrimaryKey]
    [Column("key")]
    public string Key { get; set; } = string.Empty;

    [Column("value")]
    public string Value { get; set; } = string.Empty;
}
