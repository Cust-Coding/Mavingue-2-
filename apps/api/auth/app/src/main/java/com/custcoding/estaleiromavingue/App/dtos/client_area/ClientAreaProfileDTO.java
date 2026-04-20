package com.custcoding.estaleiromavingue.App.dtos.client_area;

import com.custcoding.estaleiromavingue.App.auth.dto.MeResponse;
import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterResponseDTO;

import java.util.List;

public record ClientAreaProfileDTO(
        MeResponse account,
        CustomerResponseDTO customer,
        CustomerWaterResponseDTO waterCustomer,
        List<CustomerWaterResponseDTO> waterCustomers
) {}
