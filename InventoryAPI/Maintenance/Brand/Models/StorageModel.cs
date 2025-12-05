using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class StorageModel
    {
        [Key]
        [BsonId]
        public int id { get; set; }
        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }
        [Required]
        [BsonElement("storageName")]
        public string? storageName { get; set; }
        [Required]
        [BsonElement("storageType")]
        public string? storageType { get; set; }
        [Required]
        [BsonElement("storageInterface")]
        public string? storageInterface { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }
}
