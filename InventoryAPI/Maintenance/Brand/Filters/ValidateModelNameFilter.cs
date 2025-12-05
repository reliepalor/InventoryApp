using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using InventoryAPI.Maintenance.Brand.Models;

namespace InventoryAPI.Maintenance.Brand.Filters
{
    public class ValidateModelNameFilter : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context.ActionArguments.TryGetValue("model", out var modelObj) && modelObj is BrandModel model)
            {
                if (string.IsNullOrWhiteSpace(model.modelName))
                {
                    context.Result = new BadRequestObjectResult("Model name is required");
                    return;
                }
            }
            if (context.ActionArguments.TryGetValue("motherboard", out var motherboardObj) && motherboardObj is Motherboard motherboard)
            {
                if (string.IsNullOrWhiteSpace(motherboard.mbName))
                {
                    context.Result = new BadRequestObjectResult("Motherboard name is required");
                    return;
                }
            }
            await next();
        }
    }
}
