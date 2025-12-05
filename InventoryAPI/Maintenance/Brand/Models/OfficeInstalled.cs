using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class OfficeInstalled
    {
        [Key]
        [BsonId]
        public int id { get; set; }
        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }
        [BsonElement("officeName")]
        public string? officeName { get; set; }
        [BsonElement("officeVersion")]
        public string? officeVersion { get; set; }

        public DateTime created_at { get; set; }

        public DateTime updated_at { get; set; }
    }
}
