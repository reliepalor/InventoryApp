using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Maintenance.Brand.Interfaces;
using InventoryAPI.Maintenance.Brand.Models;
using InventoryAPI.Maintenance.Brand.Filters;

namespace InventoryAPI.Maintenance.Brand.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaintenanceController : ControllerBase
    {
        private readonly IModelRepository<BrandModel> _repository;
        private readonly IMotherboardRepository<Motherboard> _mbRepository;
        private readonly IOfficeInstalledRepository<OfficeInstalled> _officeRepository;
        private readonly IOsInstalledRepository<OsInstalled> _osRepository;
        private readonly IProcessorRepository<Processor> _processorRepository;
        private readonly IRamModelRepository<RamModel> _ramModelRepository;
        private readonly IRamSizeRepository<RamSize> _ramSizeRepository;
        private readonly IStorageModelRepository<StorageModel> _storageModelRepository;
        private readonly IStorageSizeRepository<StorageSize> _storageSizeRepository;
        private readonly IVideoCardMemoryRepository<VideoCardMemory> _videoCardMemoryRepository;
        private readonly IVideoCardModelRepository<VideoCardModel> _videoCardModelRepository;

        public MaintenanceController(
            IModelRepository<BrandModel> repository,
            IMotherboardRepository<Motherboard> mbRepository,
            IOfficeInstalledRepository<OfficeInstalled> officeRepository,
            IOsInstalledRepository<OsInstalled> osRepository,
            IProcessorRepository<Processor> processorRepository,
            IRamModelRepository<RamModel> ramModelRepository,
            IRamSizeRepository<RamSize> ramSizeRepository,
            IStorageModelRepository<StorageModel> storageModelRepository,
            IStorageSizeRepository<StorageSize> storageSizeRepository,
            IVideoCardMemoryRepository<VideoCardMemory> videoCardMemoryRepository,
            IVideoCardModelRepository<VideoCardModel> videoCardModelRepository)
        {
            _repository = repository;
            _mbRepository = mbRepository;
            _officeRepository = officeRepository;
            _osRepository = osRepository;
            _processorRepository = processorRepository;
            _ramModelRepository = ramModelRepository;
            _ramSizeRepository = ramSizeRepository;
            _storageModelRepository = storageModelRepository;
            _storageSizeRepository = storageSizeRepository;
            _videoCardMemoryRepository = videoCardMemoryRepository;
            _videoCardModelRepository = videoCardModelRepository;
        }

        #region BrandModel Methods
        [HttpGet("getAllModels")]
        public async Task<ActionResult> GetAllBrandModels()
        {
            try
            {
                var models = await _repository.GetAllBrandModels();
                return Ok(models);
            }
            catch (Exception ex)
            {
                string message = "No Models Found";
                return StatusCode(500, message);
            }
        }
        [HttpGet("getBrandModelById/{id}")]
        public async Task<ActionResult> GetBrandModelById(int id)
        {
            try
            {
                var brandModels = await _repository.GetBrandModelById(id);
                if (brandModels == null || !brandModels.Any())
                {
                    return NotFound("No Model Found");
                }
                return Ok(brandModels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the Model");
            }
        }
        [HttpPut("updateModel/{id}")]
        [ServiceFilter(typeof(ValidateModelNameFilter))]
        [ServiceFilter(typeof(CheckModelNameExistsFilter))]
        public async Task<ActionResult> Update(int id, [FromBody] BrandModel model)
        {
            var affected = await _repository.Update(model, id);
            if (affected > 0)
            {
                string Message = "Model successfully updated.";
                return Ok(Message);
            }

            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteModel/{id}")]
        public async Task<ActionResult> DeleteModel(int id)
        {
            var deleted = await _repository.DeleteModel(id);
            if (deleted > 0)
            {
                string Message = "Model successfully deleted.";
                return Ok(Message);
            }
            return StatusCode(500, "Delete failed");
        }

        [HttpPost("createModel")]
        [ServiceFilter(typeof(ValidateModelNameFilter))]
        [ServiceFilter(typeof(CheckModelNameExistsFilter))]
        public async Task<ActionResult> CreateModel([FromBody] BrandModel model)
        {
            var affected = await _repository.CreateModel(model);
            if (affected > 0)
            {
                string Message = "Model successfully created.";
                return Ok(Message);
            }

            return StatusCode(500, "Insert failed");
        }
        #endregion

        #region Motherboard Methods
        [HttpGet("getAllMotherboard")]
        public async Task<ActionResult> GetAllMotherboards()
        {
            try
            {
                var motherboards = await _mbRepository.GetAllMotherboards();
                return Ok(motherboards);
            }
            catch (Exception ex)
            {
                string Message = "No Motherboard Found";
                return StatusCode(500, Message);
            }
        }
        [HttpGet("getMotherboardById/{id}")]
        public async Task<ActionResult> GetMotherboardById(int id)
        {
            try
            {
                var motherboard = await _mbRepository.GetMotherboardById(id);
                if (motherboard == null || !motherboard.Any())
                {
                    return NotFound("No Motherboard Found");
                }
                return Ok(motherboard);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the motherboard");
            }
        }
        [HttpPost("createMotherboard")]
        public async Task<ActionResult> CreateMotherboard([FromBody] Motherboard motherboard)
        {
            var affected = await _mbRepository.CreateMotherboard(motherboard);
            if (affected > 0)
            {
                string Message = "Motherboard successfully created.";
                return Ok(Message);
            }

            return StatusCode(500, "Insert failed");
        }
        [HttpPut("updateMotherboard/{id}")]
        public async Task<ActionResult> UpdateMotherboard(int id, [FromBody] Motherboard motherboard)
        {
            var affected = await _mbRepository.UpdateMotherboard(motherboard, id);
            if (affected > 0)
            {
                string Message = "Motherboard successfully updated.";
                return Ok(Message);
            }
            return StatusCode(500, "Update failed");
        }
        [HttpDelete("deleteMotherboard/{id}")]
        public async Task<ActionResult> DeleteMotherboard(int id)
        {
            var deleted = await _mbRepository.DeleteMotherboard(id);
            if (deleted > 0)
            {
                string Message = "Motherboard successfully deleted.";
                return Ok(Message);
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region OfficeInstalled Methods
        [HttpGet("getAllOfficeInstalled")]
        public async Task<ActionResult> GetAllOfficeInstalled()
        {
            try
            {
                var offices = await _officeRepository.GetAllOfficeInstalled();
                return Ok(offices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No Office Installed Found");
            }
        }

        [HttpGet("getOfficeInstalledById/{id}")]
        public async Task<ActionResult> GetOfficeInstalledById(int id)
        {
            try
            {
                var office = await _officeRepository.GetOfficeInstalledById(id);
                if (office == null || !office.Any())
                {
                    return NotFound("No Office Installed Found");
                }
                return Ok(office);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the Office Installed");
            }
        }

        [HttpPost("createOfficeInstalled")]
        public async Task<ActionResult> CreateOfficeInstalled([FromBody] OfficeInstalled officeInstalled)
        {
            var affected = await _officeRepository.CreateOfficeInstalled(officeInstalled);
            if (affected > 0)
            {
                return Ok("Office Installed successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateOfficeInstalled/{id}")]
        public async Task<ActionResult> UpdateOfficeInstalled(int id, [FromBody] OfficeInstalled officeInstalled)
        {
            var affected = await _officeRepository.UpdateOfficeInstalled(officeInstalled, id);
            if (affected > 0)
            {
                return Ok("Office Installed successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteOfficeInstalled/{id}")]
        public async Task<ActionResult> DeleteOfficeInstalled(int id)
        {
            var deleted = await _officeRepository.DeleteOfficeInstalled(id);
            if (deleted > 0)
            {
                return Ok("Office Installed successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region OsInstalled Methods
        [HttpGet("getAllOsInstalled")]
        public async Task<ActionResult> GetAllOsInstalled()
        {
            try
            {
                var osList = await _osRepository.GetAllOsInstalled();
                return Ok(osList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No OS Installed Found");
            }
        }

        [HttpGet("getOsInstalledById/{id}")]
        public async Task<ActionResult> GetOsInstalledById(int id)
        {
            try
            {
                var os = await _osRepository.GetOsInstalledById(id);
                if (os == null || !os.Any())
                {
                    return NotFound("No OS Installed Found");
                }
                return Ok(os);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the OS Installed");
            }
        }

        [HttpPost("createOsInstalled")]
        public async Task<ActionResult> CreateOsInstalled([FromBody] OsInstalled osInstalled)
        {
            var affected = await _osRepository.CreateOsInstalled(osInstalled);
            if (affected > 0)
            {
                return Ok("OS Installed successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateOsInstalled/{id}")]
        public async Task<ActionResult> UpdateOsInstalled(int id, [FromBody] OsInstalled osInstalled)
        {
            var affected = await _osRepository.UpdateOsInstalled(osInstalled, id);
            if (affected > 0)
            {
                return Ok("OS Installed successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteOsInstalled/{id}")]
        public async Task<ActionResult> DeleteOsInstalled(int id)
        {
            var deleted = await _osRepository.DeleteOsInstalled(id);
            if (deleted > 0)
            {
                return Ok("OS Installed successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region Processor Methods
        [HttpGet("getAllProcessors")]
        public async Task<ActionResult> GetAllProcessors()
        {
            try
            {
                var processors = await _processorRepository.GetAllProcessors();
                return Ok(processors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No Processors Found");
            }
        }

        [HttpGet("getProcessorById/{id}")]
        public async Task<ActionResult> GetProcessorById(int id)
        {
            try
            {
                var processor = await _processorRepository.GetProcessorById(id);
                if (processor == null || !processor.Any())
                {
                    return NotFound("No Processor Found");
                }
                return Ok(processor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the Processor");
            }
        }

        [HttpPost("createProcessor")]
        public async Task<ActionResult> CreateProcessor([FromBody] Processor processor)
        {
            var affected = await _processorRepository.CreateProcessor(processor);
            if (affected > 0)
            {
                return Ok("Processor successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateProcessor/{id}")]
        public async Task<ActionResult> UpdateProcessor(int id, [FromBody] Processor processor)
        {
            var affected = await _processorRepository.UpdateProcessor(processor, id);
            if (affected > 0)
            {
                return Ok("Processor successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteProcessor/{id}")]
        public async Task<ActionResult> DeleteProcessor(int id)
        {
            var deleted = await _processorRepository.DeleteProcessor(id);
            if (deleted > 0)
            {
                return Ok("Processor successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region RamModel Methods
        [HttpGet("getAllRamModels")]
        public async Task<ActionResult> GetAllRamModels()
        {
            try
            {
                var ramModels = await _ramModelRepository.GetAllRamModels();
                return Ok(ramModels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No RAM Models Found");
            }
        }

        [HttpGet("getRamModelById/{id}")]
        public async Task<ActionResult> GetRamModelById(int id)
        {
            try
            {
                var ramModel = await _ramModelRepository.GetRamModelById(id);
                if (ramModel == null || !ramModel.Any())
                {
                    return NotFound("No RAM Model Found");
                }
                return Ok(ramModel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the RAM Model");
            }
        }

        [HttpPost("createRamModel")]
        public async Task<ActionResult> CreateRamModel([FromBody] RamModel ramModel)
        {
            var affected = await _ramModelRepository.CreateRamModel(ramModel);
            if (affected > 0)
            {
                return Ok("RAM Model successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateRamModel/{id}")]
        public async Task<ActionResult> UpdateRamModel(int id, [FromBody] RamModel ramModel)
        {
            var affected = await _ramModelRepository.UpdateRamModel(ramModel, id);
            if (affected > 0)
            {
                return Ok("RAM Model successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteRamModel/{id}")]
        public async Task<ActionResult> DeleteRamModel(int id)
        {
            var deleted = await _ramModelRepository.DeleteRamModel(id);
            if (deleted > 0)
            {
                return Ok("RAM Model successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region RamSize Methods
        [HttpGet("getAllRamSizes")]
        public async Task<ActionResult> GetAllRamSizes()
        {
            try
            {
                var ramSizes = await _ramSizeRepository.GetAllRamSizes();
                return Ok(ramSizes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No RAM Sizes Found");
            }
        }

        [HttpGet("getRamSizeById/{id}")]
        public async Task<ActionResult> GetRamSizeById(int id)
        {
            try
            {
                var ramSize = await _ramSizeRepository.GetRamSizeById(id);
                if (ramSize == null || !ramSize.Any())
                {
                    return NotFound("No RAM Size Found");
                }
                return Ok(ramSize);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the RAM Size");
            }
        }

        [HttpPost("createRamSize")]
        public async Task<ActionResult> CreateRamSize([FromBody] RamSize ramSize)
        {
            var affected = await _ramSizeRepository.CreateRamSize(ramSize);
            if (affected > 0)
            {
                return Ok("RAM Size successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateRamSize/{id}")]
        public async Task<ActionResult> UpdateRamSize(int id, [FromBody] RamSize ramSize)
        {
            var affected = await _ramSizeRepository.UpdateRamSize(ramSize, id);
            if (affected > 0)
            {
                return Ok("RAM Size successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteRamSize/{id}")]
        public async Task<ActionResult> DeleteRamSize(int id)
        {
            var deleted = await _ramSizeRepository.DeleteRamSize(id);
            if (deleted > 0)
            {
                return Ok("RAM Size successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region StorageModel Methods
        [HttpGet("getAllStorageModels")]
        public async Task<ActionResult> GetAllStorageModels()
        {
            try
            {
                var storageModels = await _storageModelRepository.GetAllStorageModels();
                return Ok(storageModels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No Storage Models Found");
            }
        }

        [HttpGet("getStorageModelById/{id}")]
        public async Task<ActionResult> GetStorageModelById(int id)
        {
            try
            {
                var storageModel = await _storageModelRepository.GetStorageModelById(id);
                if (storageModel == null || !storageModel.Any())
                {
                    return NotFound("No Storage Model Found");
                }
                return Ok(storageModel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the Storage Model");
            }
        }

        [HttpPost("createStorageModel")]
        public async Task<ActionResult> CreateStorageModel([FromBody] StorageModel storageModel)
        {
            var affected = await _storageModelRepository.CreateStorageModel(storageModel);
            if (affected > 0)
            {
                return Ok("Storage Model successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateStorageModel/{id}")]
        public async Task<ActionResult> UpdateStorageModel(int id, [FromBody] StorageModel storageModel)
        {
            var affected = await _storageModelRepository.UpdateStorageModel(storageModel, id);
            if (affected > 0)
            {
                return Ok("Storage Model successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteStorageModel/{id}")]
        public async Task<ActionResult> DeleteStorageModel(int id)
        {
            var deleted = await _storageModelRepository.DeleteStorageModel(id);
            if (deleted > 0)
            {
                return Ok("Storage Model successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region StorageSize Methods
        [HttpGet("getAllStorageSizes")]
        public async Task<ActionResult> GetAllStorageSizes()
        {
            try
            {
                var storageSizes = await _storageSizeRepository.GetAllStorageSizes();
                return Ok(storageSizes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No Storage Sizes Found");
            }
        }

        [HttpGet("getStorageSizeById/{id}")]
        public async Task<ActionResult> GetStorageSizeById(int id)
        {
            try
            {
                var storageSize = await _storageSizeRepository.GetStorageSizeById(id);
                if (storageSize == null || !storageSize.Any())
                {
                    return NotFound("No Storage Size Found");
                }
                return Ok(storageSize);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the Storage Size");
            }
        }

        [HttpPost("createStorageSize")]
        public async Task<ActionResult> CreateStorageSize([FromBody] StorageSize storageSize)
        {
            var affected = await _storageSizeRepository.CreateStorageSize(storageSize);
            if (affected > 0)
            {
                return Ok("Storage Size successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateStorageSize/{id}")]
        public async Task<ActionResult> UpdateStorageSize(int id, [FromBody] StorageSize storageSize)
        {
            var affected = await _storageSizeRepository.UpdateStorageSize(storageSize, id);
            if (affected > 0)
            {
                return Ok("Storage Size successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteStorageSize/{id}")]
        public async Task<ActionResult> DeleteStorageSize(int id)
        {
            var deleted = await _storageSizeRepository.DeleteStorageSize(id);
            if (deleted > 0)
            {
                return Ok("Storage Size successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region VideoCardMemory Methods
        [HttpGet("getAllVideoCardMemories")]
        public async Task<ActionResult> GetAllVideoCardMemories()
        {
            try
            {
                var videoCardMemories = await _videoCardMemoryRepository.GetAllVideoCardMemories();
                return Ok(videoCardMemories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No Video Card Memories Found");
            }
        }

        [HttpGet("getVideoCardMemoryById/{id}")]
        public async Task<ActionResult> GetVideoCardMemoryById(int id)
        {
            try
            {
                var videoCardMemory = await _videoCardMemoryRepository.GetVideoCardMemoryById(id);
                if (videoCardMemory == null || !videoCardMemory.Any())
                {
                    return NotFound("No Video Card Memory Found");
                }
                return Ok(videoCardMemory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the Video Card Memory");
            }
        }

        [HttpPost("createVideoCardMemory")]
        public async Task<ActionResult> CreateVideoCardMemory([FromBody] VideoCardMemory videoCardMemory)
        {
            var affected = await _videoCardMemoryRepository.CreateVideoCardMemory(videoCardMemory);
            if (affected > 0)
            {
                return Ok("Video Card Memory successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateVideoCardMemory/{id}")]
        public async Task<ActionResult> UpdateVideoCardMemory(int id, [FromBody] VideoCardMemory videoCardMemory)
        {
            var affected = await _videoCardMemoryRepository.UpdateVideoCardMemory(videoCardMemory, id);
            if (affected > 0)
            {
                return Ok("Video Card Memory successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteVideoCardMemory/{id}")]
        public async Task<ActionResult> DeleteVideoCardMemory(int id)
        {
            var deleted = await _videoCardMemoryRepository.DeleteVideoCardMemory(id);
            if (deleted > 0)
            {
                return Ok("Video Card Memory successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion

        #region VideoCardModel Methods
        [HttpGet("getAllVideoCardModels")]
        public async Task<ActionResult> GetAllVideoCardModels()
        {
            try
            {
                var videoCardModels = await _videoCardModelRepository.GetAllVideoCardModels();
                return Ok(videoCardModels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "No Video Card Models Found");
            }
        }

        [HttpGet("getVideoCardModelById/{id}")]
        public async Task<ActionResult> GetVideoCardModelById(int id)
        {
            try
            {
                var videoCardModel = await _videoCardModelRepository.GetVideoCardModelById(id);
                if (videoCardModel == null || !videoCardModel.Any())
                {
                    return NotFound("No Video Card Model Found");
                }
                return Ok(videoCardModel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving the Video Card Model");
            }
        }

        [HttpPost("createVideoCardModel")]
        public async Task<ActionResult> CreateVideoCardModel([FromBody] VideoCardModel videoCardModel)
        {
            var affected = await _videoCardModelRepository.CreateVideoCardModel(videoCardModel);
            if (affected > 0)
            {
                return Ok("Video Card Model successfully created.");
            }
            return StatusCode(500, "Insert failed");
        }

        [HttpPut("updateVideoCardModel/{id}")]
        public async Task<ActionResult> UpdateVideoCardModel(int id, [FromBody] VideoCardModel videoCardModel)
        {
            var affected = await _videoCardModelRepository.UpdateVideoCardModel(videoCardModel, id);
            if (affected > 0)
            {
                return Ok("Video Card Model successfully updated.");
            }
            return StatusCode(500, "Update failed");
        }

        [HttpDelete("deleteVideoCardModel/{id}")]
        public async Task<ActionResult> DeleteVideoCardModel(int id)
        {
            var deleted = await _videoCardModelRepository.DeleteVideoCardModel(id);
            if (deleted > 0)
            {
                return Ok("Video Card Model successfully deleted.");
            }
            return StatusCode(500, "Delete failed");
        }
        #endregion
    }
}
