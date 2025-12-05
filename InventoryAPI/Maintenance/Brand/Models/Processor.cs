using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Maintenance.Brand.Models
{
    [BsonIgnoreExtraElements]
    public class Processor
    {
        [Key]
        [BsonId]
        public int id { get; set; }

        [BsonElement("referenceId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? referenceId { get; set; }

        [BsonElement("processorName")]
        public string? processorName { get; set; }
        [BsonElement("processorCore")]
        public string? processorCore { get; set; }
        [BsonElement("processorThreads")]
        public string? processorThreads { get; set; }
        [BsonElement("iGpu")]
        public bool iGpu { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }
}
