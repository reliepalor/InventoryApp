using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class Motherboard
    {
        [Key]
        [BsonId]
        public int id { get; set; }
        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }
        [Required]
        [Column(TypeName = "varchar(50)")]
        [BsonElement("mbName")]
        public string? mbName { get; set; }
        [Required]
        [BsonElement("mbSocket")]
        public string? mbSocket { get; set; }
        [Required]
        [BsonElement("mbChipset")]
        public string? mbChipset { get; set; }
        [Required]
        [BsonElement("mbDescription")]
        public string? mbDescription { get; set; }
        [BsonElement("created_at")]
        public DateTime created_at { get; set; }
        [BsonElement("updated_at")]
        public DateTime updated_at { get; set; }
    }
}
