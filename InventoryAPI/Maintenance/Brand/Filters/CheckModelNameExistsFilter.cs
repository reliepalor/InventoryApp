using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using InventoryAPI.Maintenance.Brand.Models;
using InventoryAPI.Maintenance.Brand.Interfaces;

namespace InventoryAPI.Maintenance.Brand.Filters
{
    public class CheckModelNameExistsFilter : IAsyncActionFilter
    {
        private readonly IModelRepository<BrandModel> _repository;
        private readonly IMotherboardRepository<Motherboard> _mbRepository;

        public CheckModelNameExistsFilter(IModelRepository<BrandModel> repository, IMotherboardRepository<Motherboard> mbRepository)
        {
            _repository = repository;
            _mbRepository = mbRepository;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context.ActionArguments.TryGetValue("model", out var modelObj) && modelObj is BrandModel model)
            {
                if (await _repository.ModelNameExistsAsync(model.modelName))
                {
                    context.Result = new ConflictObjectResult($"Model name '{model.modelName}' already exists");
                    return;
                }
            }
            if (context.ActionArguments.TryGetValue("motherboard", out var motherboardObj) && motherboardObj is Motherboard motherboard)
            {
                if (await _mbRepository.mbNameExistsAsync(motherboard.mbName))
                {
                    context.Result = new ConflictObjectResult($"Motherboard name '{motherboard.mbName}' already exists");
                    return;
                }
            }
            await next();
        }
    }
}
